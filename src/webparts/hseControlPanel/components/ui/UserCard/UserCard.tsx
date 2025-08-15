import * as React from "react";
import { Persona, PersonaSize, PersonaPresence, Text } from "@fluentui/react";
import styles from "./UserCard.module.scss";

export interface IUserCardProps {
  user?: {
    name: string;
    email: string;
    photoUrl?: string;
    isActive?: boolean;
  };
  showNotSelected?: boolean;
  size?: PersonaSize;
  className?: string;
}

const UserCard: React.FC<IUserCardProps> = ({
  user,
  showNotSelected = true,
  size = PersonaSize.size32,
  className = "",
}) => {
  if (!user) {
    if (!showNotSelected) {
      return null;
    }

    return (
      <div className={`${styles.userCard} ${styles.notSelected} ${className}`}>
        <div className={styles.emptyPersona}>
          <span className={styles.emptyIcon}>👤</span>
        </div>
        <Text variant="small" className={styles.notSelectedText}>
          Não atribuído
        </Text>
      </div>
    );
  }

  return (
    <div className={`${styles.userCard} ${className}`}>
      <Persona
        imageUrl={user.photoUrl}
        text={user.name}
        secondaryText={user.email}
        size={size}
        presence={
          user.isActive !== false
            ? PersonaPresence.online
            : PersonaPresence.offline
        }
        hidePersonaDetails={true}
        className={styles.persona}
      />
      <div className={styles.userInfo}>
        <Text variant="small" className={styles.userName}>
          {user.name}
        </Text>
      </div>
    </div>
  );
};

export default UserCard;
