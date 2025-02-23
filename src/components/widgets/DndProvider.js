import {HTML5Backend} from 'react-dnd-html5-backend';
import {DndProvider} from 'react-dnd';

const DragDropContextProvider = ({children}) => (
    <DndProvider backend={HTML5Backend}>
        {children}
    </DndProvider>
);

export default DragDropContextProvider;
