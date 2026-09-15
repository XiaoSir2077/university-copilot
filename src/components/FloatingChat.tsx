import { useEffect, useRef, useState } from 'react'
import { Bot, Heart, Send, Sparkles } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { actions, useBoard } from '@/store/useBoard'
import { evaluateSisterInput } from '@/agent/brain'
import type { ChatChannel } from '@/types'
import { cn } from '@/lib/utils'

function fmt(ts: number) {
  const d = new Date(ts)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function Bubble({
  role,
  text,
  time,
}: {
  role: 'sister' | 'agent' | 'brother'
  text: string
  time: number
}) {
  const isMe = role === 'sister'
  return (
    <div className={cn('flex gap-2 items-end', isMe && 'flex-row-reverse')}>
      <Avatar className="h-7 w-7 shrink-0">
        <AvatarFallback
          className={cn(
            'text-[10px]',
            isMe
              ? 'bg-gradient-to-br from-pink-400 to-rose-500 text-white'
              : role === 'brother'
                ? 'bg-gradient-to-br from-indigo-400 to-blue-600 text-white'
                : 'bg-gradient-to-br from-amber-400 to-orange-500 text-white',
          )}
        >
          {isMe ? '妹' : role === 'brother' ? '哥' : 'AI'}
        </AvatarFallback>
      </Avatar>
      <div
        className={cn(
          'max-w-[78%] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm whitespace-pre-line',
          isMe
            ? 'bg-gradient-to-br from-pink-500 to-rose-500 text-white rounded-br-sm'
            : 'bg-white border border-zinc-100 rounded-bl-sm',
        )}
      >
        {text}
        <div className={cn('text-[10px] mt-1', isMe ? 'text-rose-100' : 'text-zinc-400')}>{fmt(time)}</div>
      </div>
    </div>
  )
}

function Channel({
  channel,
  placeholder,
}: {
  channel: ChatChannel
  placeholder: string
}) {
  const board = useBoard()
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const msgs = board.messages.filter((m) => m.channel === channel)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs.length, typing])

  const send = () => {
    const text = input.trim()
    if (!text) return
    setInput('')
    actions.addMessage({ channel, role: 'sister', text })

    if (channel === 'brother') {
      // 原型：消息直达哥哥看板，哥哥在那边回复（此处模拟一条回执提示）
      setTimeout(() => {
        actions.addMessage({
          channel,
          role: 'agent',
          text: '已悄悄传给哥哥啦，他去他的看板就能看到。 prototype 阶段哥哥在那边回复你哦～',
        })
      }, 600)
      return
    }

    // AI 管家频道：走规则引擎评估
    setTyping(true)
    setTimeout(() => {
      const reply = evaluateSisterInput(text)
      if (reply.kind === 'request' && reply.request) {
        actions.addRequest(reply.request)
      }
      actions.addMessage({ channel, role: 'agent', text: reply.text })
      setTyping(false)
    }, 700 + Math.random() * 500)
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 px-1">
        <div className="flex flex-col gap-3 py-2">
          {channel === 'brother' && (
            <div className="text-center">
              <Badge variant="secondary" className="bg-rose-50 text-rose-500 border-rose-100 gap-1">
                <Heart className="h-3 w-3" /> 这里只有你和哥哥看得见
              </Badge>
            </div>
          )}
          {msgs.map((m) => (
            <Bubble key={m.id} role={m.role} text={m.text} time={m.createdAt} />
          ))}
          {typing && (
            <div className="flex gap-2 items-end">
              <Avatar className="h-7 w-7 shrink-0">
                <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white text-[10px]">
                  AI
                </AvatarFallback>
              </Avatar>
              <div className="bg-white border border-zinc-100 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
      <div className="pt-2 pb-1 flex gap-2 items-center border-t border-zinc-100 mt-1">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder={placeholder}
          className="flex-1 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100"
        />
        <Button
          onClick={send}
          size="icon"
          className="rounded-full bg-gradient-to-br from-pink-500 to-rose-500 hover:opacity-90 shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export default function FloatingChat() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-4 z-50 flex items-center gap-2 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 text-white pl-4 pr-5 py-3.5 shadow-lg shadow-rose-200 active:scale-95 transition-transform"
        aria-label="打开 AI 管家"
      >
        <Sparkles className="h-5 w-5" />
        <span className="text-sm font-medium">AI 管家</span>
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="h-[78dvh] rounded-t-3xl px-4 pt-3 pb-1 flex flex-col gap-2 sm:max-w-md sm:mx-auto"
        >
          <SheetHeader className="flex flex-row items-center justify-between space-y-0">
            <SheetTitle className="flex items-center gap-2 text-base">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white">
                <Bot className="h-4.5 w-4.5" />
              </span>
              妹妹的小助手
              <Badge variant="secondary" className="text-[10px] font-normal">
                原型 · 规则引擎
              </Badge>
            </SheetTitle>
          </SheetHeader>

          <Tabs defaultValue="agent" className="flex-1 flex flex-col min-h-0">
            <TabsList className="grid grid-cols-2 rounded-full bg-zinc-100 p-1">
              <TabsTrigger value="agent" className="rounded-full text-sm">
                🤖 AI 管家
              </TabsTrigger>
              <TabsTrigger value="brother" className="rounded-full text-sm">
                💌 和哥哥聊聊
              </TabsTrigger>
            </TabsList>
            <TabsContent value="agent" className="flex-1 min-h-0 mt-2 flex flex-col">
              <Channel channel="agent" placeholder="试试：我想…（诉求会评估后进哥哥看板）" />
            </TabsContent>
            <TabsContent value="brother" className="flex-1 min-h-0 mt-2 flex flex-col">
              <Channel channel="brother" placeholder="给哥哥发悄悄话…" />
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>
    </>
  )
}
