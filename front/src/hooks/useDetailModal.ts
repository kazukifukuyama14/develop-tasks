import { useState } from "react";

import { useModal } from "./useModal";

export const useDetailModal = () => {
  const modal = useModal();
  const [taskId, setTaskId] = useState<string | undefined>(undefined);

  const onOpen = (id: string) => {
    modal.onOpen();
    setTaskId(id);
  };

  return {
    ...modal,
    taskId,
    onOpen,
  };
};
