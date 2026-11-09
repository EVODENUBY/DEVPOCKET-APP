import { EmptyState } from '../../src/components/ui/EmptyState';
import { Screen } from '../../src/components/ui/Screen';

export default function ProjectsScreen() {
  return (
    <Screen
      title="Projects"
      subtitle="Repositories from your connected providers."
    >
      <EmptyState
        title="No provider data available"
        description="Repository connections are not implemented yet. Connectors will be added after secure account authorization is in place."
        label="Integrations unavailable"
      />
    </Screen>
  );
}
