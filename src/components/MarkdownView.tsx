import { useMemo } from 'react'
import { marked } from 'marked'

// Markdown 渲染。内容来自构建时打包的本地笔记文件（作者即项目维护者），
// 非用户输入，因此不引入 DOMPurify；接入后端/多用户后需补 XSS 过滤。
marked.setOptions({ gfm: true, breaks: false })

export default function MarkdownView({ md }: { md: string }) {
  const html = useMemo(() => marked.parse(md) as string, [md])
  return <div className="md-body" dangerouslySetInnerHTML={{ __html: html }} />
}
