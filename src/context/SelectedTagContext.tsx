import { createContext, useContext, useMemo, useState } from "react";
import { useTags } from "./TagsContext";

interface ISelectedTagContext {
  selectedTag?: TagSchema;
  setSelection: (tag: TagSchema | undefined, invert?: boolean) => void;
  inverted: boolean;
}

const SelectedTagContext = createContext<ISelectedTagContext | undefined>(
  undefined
);

export function SelectedTagProvider(props: {
  value?: string;
  children: React.ReactNode;
}) {
  const { tags } = useTags();

  const [selectedTag, setSelectedTag] = useState<TagSchema | undefined>(
    props.value ? tags.get(props.value) : undefined
  );

  const [inverted, setInverted] = useState(false);

  const value = useMemo(
    () => ({
      selectedTag,
      inverted,
      setSelection: (tag: TagSchema | undefined, invert: boolean = false) => {
        setSelectedTag(tag);
        setInverted(invert);
      },
    }),
    [inverted, selectedTag]
  );

  return (
    <SelectedTagContext.Provider value={value}>
      {props.children}
    </SelectedTagContext.Provider>
  );
}

export function useSelectedTag(): ISelectedTagContext {
  const selectedTag = useContext(SelectedTagContext);

  return selectedTag!;
}
