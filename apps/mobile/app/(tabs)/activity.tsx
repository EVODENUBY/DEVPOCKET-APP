import { EmptyState } from '../../src/components/ui/EmptyState';
import { Screen } from '../../src/components/ui/Screen';

export default function ActivityScreen() {
  return (
    <Screen
      title="Activity"
      subtitle="A unified view of repository and deployment events."
    >
      <EmptyState
        title="Activity is not available yet"
        description="There are no provider events to show. Activity collection will be added with provider synchronization."
        label="Waiting for integrations"
      />
    </Screen>
  );
}
