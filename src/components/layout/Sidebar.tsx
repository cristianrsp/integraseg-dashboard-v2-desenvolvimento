import { NavLink } from '@/components/NavLink';
import { LayoutDashboard, Users, FileUp, History, BarChart3, DollarSign } from 'lucide-react';

const navItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Vendedores', url: '/vendedores', icon: Users },
  { title: 'Importar Resultados', url: '/importar', icon: FileUp },
  { title: 'Histórico', url: '/historico', icon: History },
  { title: 'Comissionamento', url: '/comissionamento', icon: DollarSign },
];

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar text-sidebar-foreground">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
            <BarChart3 className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">IntegraSeg</h1>
            <p className="text-xs text-sidebar-foreground/60">Performance de Vendas</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <NavLink key={item.url} to={item.url} end={item.url === '/'}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-all hover:bg-sidebar-accent hover:text-sidebar-foreground"
              activeClassName="bg-sidebar-accent text-sidebar-foreground">
              <item.icon className="h-5 w-5" />
              {item.title}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-sidebar-border p-4">
          <p className="text-xs text-sidebar-foreground/50 text-center">© 2024 IntegraSeg</p>
        </div>
      </div>
    </aside>
  );
}
