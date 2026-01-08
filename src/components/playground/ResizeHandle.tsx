import { Separator as PanelResizeHandle } from 'react-resizable-panels';

interface ResizeHandleProps {
    className?: string;
    orientation?: "horizontal" | "vertical";
}

const ResizeHandle = ({ className = "", orientation = "horizontal" }: ResizeHandleProps) => (
    <PanelResizeHandle className={`flex items-center justify-center bg-gray-900 hover:bg-gray-800 transition-colors ${className} ${orientation === 'vertical' ? 'h-3 w-full cursor-row-resize' : 'w-3 h-full cursor-col-resize'}`}>
        <div className={`bg-gray-600 rounded-full ${orientation === 'vertical' ? 'h-1 w-12' : 'w-1 h-12'}`} />
    </PanelResizeHandle>
);

export default ResizeHandle;
