import { Policy } from '@/types/policy';

interface PolicyListProps {
  policies: Policy[];
}

export function PolicyList({ policies }: PolicyListProps) {
  if (policies.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        You haven't created any policies yet. Click 'Create New Policy' to get started.
      </p>
    );
  }

  return (
    <div className="grid gap-4">
      {policies.map((policy) => (
        <div
          key={policy.id}
          className="p-4 rounded-lg border hover:border-primary transition-colors"
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium">{policy.title}</h3>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                policy.status === 'published'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              {policy.status}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{policy.description}</p>
          <div className="mt-2 text-xs text-muted-foreground">
            Created: {new Date(policy.created_at).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  );
}
