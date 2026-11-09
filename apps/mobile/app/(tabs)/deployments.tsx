import { EmptyState } from '../../src/components/ui/EmptyState';
import { Screen } from '../../src/components/ui/Screen';

export default function DeploymentsScreen() {
  return (
    <Screen
      title="Deployments"
      subtitle="Deployment history across your services."
    >
      <EmptyState
        title="No deployment data available"
        description="Vercel and Render monitoring is not implemented yet. Deployment status will only appear after an authorized provider connection."
        label="Integrations unavailable"
      />
    </Screen>
  );
}
