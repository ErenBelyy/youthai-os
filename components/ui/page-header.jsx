export default function PageHeader({ title, subtitle, icon: Icon, actions, gradient = 'from-brand-500 via-aurora-violet to-aurora-cyan' }) {
  return (
    <div className="relative px-6 md:px-8 pt-6 pb-4 border-b border-border">
      <div className="flex items-start gap-4">
        {Icon && (
          <div className={`shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg shadow-brand-500/20`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-display font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
