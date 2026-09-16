import { useEffect, useMemo, useRef, useState } from 'react'

// 注入到 srcdoc 里的高度上报脚本：load + ResizeObserver 双保险
const RESIZE_SNIPPET = `<script>(function(){
  function send(){
    var el = document.documentElement, b = document.body;
    var h = Math.max(el ? el.scrollHeight : 0, b ? b.scrollHeight : 0);
    if (h > 0) parent.postMessage({ __bookHeight: h }, '*');
  }
  window.addEventListener('load', function(){ send(); setTimeout(send, 300); setTimeout(send, 1200); });
  if (window.ResizeObserver) new ResizeObserver(send).observe(document.body);
})();</script>`

/**
 * HTML 章节渲染器：把完整 HTML 文档放进 iframe 渲染，
 * 样式与主应用隔离（iframe 边界），高度随内容自动伸缩。
 *
 * 安全说明：iframe 未加 sandbox，因为内容与主应用同源才能可靠读取
 * 高度，且实测 Edge 中 sandbox + srcdoc 组合存在渲染兼容问题。
 * 当前内容为构建时打包的本地可信文件（由维护者生成并 review）；
 * 若未来接入后端下发或用户上传的 HTML，必须先做 DOMPurify 清洗、
 * 再考虑恢复 sandbox（allow-scripts）。
 */
export default function HtmlView({ html }: { html: string }) {
  const frameRef = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState(800)

  const srcDoc = useMemo(() => {
    const trimmed = html.trim()
    if (trimmed.toLowerCase().includes('</body>')) {
      return trimmed.replace(/<\/body>/i, `${RESIZE_SNIPPET}</body>`)
    }
    return trimmed + RESIZE_SNIPPET
  }, [html])

  // 高度来源 1：iframe 内 postMessage（脚本注入 snippet 上报）
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.source !== frameRef.current?.contentWindow) return
      const data = e.data as { __bookHeight?: number } | undefined
      if (typeof data?.__bookHeight === 'number' && data.__bookHeight > 0) {
        setHeight(Math.min(data.__bookHeight + 4, 20000))
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  // 高度来源 2（兜底）：同源直接读取，load 后量几次
  useEffect(() => {
    const t1 = setTimeout(() => {
      const doc = frameRef.current?.contentDocument
      if (doc) {
        const h = Math.max(doc.documentElement?.scrollHeight ?? 0, doc.body?.scrollHeight ?? 0)
        if (h > 0) setHeight(Math.min(h + 4, 20000))
      }
    }, 600)
    const t2 = setTimeout(() => {
      const doc = frameRef.current?.contentDocument
      if (doc) {
        const h = Math.max(doc.documentElement?.scrollHeight ?? 0, doc.body?.scrollHeight ?? 0)
        if (h > 0) setHeight(Math.min(h + 4, 20000))
      }
    }, 2000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [srcDoc])

  return (
    <iframe
      ref={frameRef}
      srcDoc={srcDoc}
      title="章节内容"
      className="block w-full rounded-xl border-0"
      style={{ height }}
    />
  )
}
