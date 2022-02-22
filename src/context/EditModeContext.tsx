import React, { useContext, useState } from "react";

type EditMode = "add" | "delete";

interface IEditModeContext {
  editMode: EditMode;
  setEditMode: (mode: EditMode) => void;
}

const EditModeContext = React.createContext<IEditModeContext | undefined>(
  undefined
);

export function EditModeProvider(props: { children: React.ReactNode }) {
  const [editMode, setEditMode] = useState<EditMode>("add");

  return (
    <EditModeContext.Provider value={{ editMode, setEditMode }}>
      {props.children}
    </EditModeContext.Provider>
  );
}

export function useEditMode(): IEditModeContext {
  return useContext(EditModeContext)!;
}
