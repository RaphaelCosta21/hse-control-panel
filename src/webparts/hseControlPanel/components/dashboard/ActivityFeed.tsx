import * as React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { IActivityItem } from "../../types/IControlPanelData";
import styles from "./ActivityFeed.module.scss";

export interface IActivityFeedProps {
  activities: IActivityItem[];
}

const ActivityFeed: React.FC<IActivityFeedProps> = ({ activities }) => {
  const getActivityIcon = (type: string): string => {
    switch (type) {
      case "Submission":
        return "📤";
      case "Evaluation":
        return "🔍";
      case "Approval":
        return "✅";
      case "Rejection":
        return "❌";
      default:
        return "📄";
    }
  };

  const getActivityColor = (type: string): string => {
    switch (type) {
      case "Submission":
        return styles.submission;
      case "Evaluation":
        return styles.evaluation;
      case "Approval":
        return styles.approval;
      case "Rejection":
        return styles.rejection;
      default:
        return styles.default;
    }
  };

  return (
    <div className={styles.activityFeed}>
      <h3>Atividade Recente</h3>

      {activities.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Nenhuma atividade recente</p>
        </div>
      ) : (
        <div className={styles.activitiesList}>
          {activities.map((activity) => (
            <div key={activity.id} className={styles.activityItem}>
              <div
                className={`${styles.activityIcon} ${getActivityColor(
                  activity.type
                )}`}
              >
                {getActivityIcon(activity.type)}
              </div>

              <div className={styles.activityContent}>
                <div className={styles.activityDescription}>
                  {activity.description}
                </div>
                <div className={styles.activityMeta}>
                  <span className={styles.activityUser}>{activity.user}</span>
                  <span className={styles.activityTime}>
                    {format(activity.timestamp, "dd/MM/yyyy HH:mm", {
                      locale: ptBR,
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
