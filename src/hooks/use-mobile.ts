import * as React from "react"

const MOBILE_BREAKPOINT = 768

function getIsMobile() {
  return typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const update = () => setIsMobile(getIsMobile())
    update()

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    mql.addEventListener("change", update)
    window.addEventListener("resize", update)
    document.addEventListener("visibilitychange", update)

    return () => {
      mql.removeEventListener("change", update)
      window.removeEventListener("resize", update)
      document.removeEventListener("visibilitychange", update)
    }
  }, [])

  return !!isMobile
}
