import { createContext } from "react";

interface ISelectedTagContext {
    selectedTag?: TagSchema;
    setSelectedTag: (tag: TagSchema | undefined) => void;
}

const SelectedTagContext = createContext<ISelectedTagContext>(
    { selectedTag: undefined, setSelectedTag: (tags) => { } }
)


export default SelectedTagContext