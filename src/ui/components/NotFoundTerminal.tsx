export const NotFoundTerminal = () => {
  return (
    <div className="no_scroll_bar terminal flex flex-col p-[10px] w-[805px] h-[604px] bg-[#282A36] opacity-[0.98] border-[#D6345B] border-[2.5px] whitespace-pre overflow-y-scroll leading-relaxed select-auto">
      <div>
        <span className="no_scroll_bar text-[16px] text-[#8BE9FD]">/</span>
        <div className="no_scroLL-bar flex-row flex-wrap text-white break-words">
          <span className="no_scroll_bar text-[16px] text-[#50FA7B]">λ{' '}</span>
          <span className="no_scroll_bar">./not_found</span>
        </div>
        <div className="no_scroll_bar break-words text-[16px]">
          <span className="no_scroll_bar text-[#8BE9FD] block w-[80ch]">
{`
                      ┏━━┓ ┏━━┓ ┏━━━━━━━┓ ┏━━┓ ┏━━┓
                      ┃  ┃ ┃  ┃ ┃  ┏━┓  ┃ ┃  ┃ ┃  ┃
                      ┃  ┃ ┃  ┃ ┃  ┃ ┃  ┃ ┃  ┃ ┃  ┃
                      ┃  ┗━┛  ┃ ┃  ┃ ┃  ┃ ┃  ┗━┛  ┃
                      ┗━━━━┓  ┃ ┃  ┃ ┃  ┃ ┗━━━━┓  ┃
                           ┃  ┃ ┃  ┃ ┃  ┃      ┃  ┃
                           ┃  ┃ ┃  ┗━┛  ┃      ┃  ┃
                           ┗━━┛ ┗━━━━━━━┛      ┗━━┛

┌─┐   ┌─┐ ┌───────┐ ┌───────┐    ┌──────┐ ┌───────┐ ┌─┐   ┌─┐ ┌─┐   ┌─┐ ┌────╲
│  ╲  │ │ │ ┌───┐ │ └──┐ ┌──┘    │ ┌────┘ │ ┌───┐ │ │ │   │ │ │  ╲  │ │ │ ┌──╲ ╲
│ ╲ ╲ │ │ │ │   │ │    │ │       │ └───┐  │ │   │ │ │ │   │ │ │ ╲ ╲ │ │ │ │   ╲ ╲
│ │╲ ╲│ │ │ │   │ │    │ │       │ ┌───┘  │ │   │ │ │ │   │ │ │ │╲ ╲│ │ │ │   │ │
│ │ ╲ │ │ │ │   │ │    │ │       │ │      │ │   │ │ │ │   │ │ │ │ ╲ │ │ │ │   │ │
│ │  ╲  │ │ │   │ │    │ │       │ │      │ │   │ │ │ │   │ │ │ │  ╲  │ │ │   ╱ ╱
│ │   │ │ │ └───┘ │    │ │       │ │      │ └───┘ │ │ └───┘ │ │ │   │ │ │ └──╱ ╱
└─┘   └─┘ └───────┘    └─┘       └─┘      └───────┘ └───────┘ └─┘   └─┘ └─────╱`}</span>
        </div>
      </div>
    </div>
  )
}
