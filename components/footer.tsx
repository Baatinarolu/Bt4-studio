import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-background mt-16">
      <div className="max-w-7xl mx-auto px-6 py-12 text-sm text-muted-foreground">
        <div className="flex flex-col md:flex-row md:justify-between gap-y-8">
          <div>
            <div className="flex items-center gap-2 font-semibold text-foreground mb-3">
              <div className="w-6 h-6 bg-foreground rounded flex items-center justify-center">
                <span className="text-background text-xs font-bold">BT4</span>
              </div>
              BT4 Studio
            </div>
            <div className="text-xs">Premium digital goods for developers.</div>
          </div>

          <div className="grid grid-cols-3 gap-x-12 gap-y-2 text-xs">
            <div>
              <div className="font-medium text-foreground mb-2">Platform</div>
              <div className="space-y-1">
                <Link href="/marketplace">Marketplace</Link><br />
                <Link href="/categories">Categories</Link><br />
                <Link href="/for-sellers">For Sellers</Link>
              </div>
            </div>
            <div>
              <div className="font-medium text-foreground mb-2">Company</div>
              <div className="space-y-1">
                <Link href="/admin">Admin</Link><br />
                <Link href="/bot">Telegram Bot</Link><br />
                <a href="https://github.com" target="_blank">GitHub</a>
              </div>
            </div>
            <div>
              <div className="font-medium text-foreground mb-2">Legal</div>
              <div className="space-y-1">
                <span>Terms</span><br />
                <span>Privacy</span><br />
                <span>Licenses</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t text-[10px] flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>© {new Date().getFullYear()} BT4 Studio. All rights reserved.</div>
          <div>20% platform fee • 80% to creators • Built with Next.js</div>
        </div>
      </div>
    </footer>
  );
}
