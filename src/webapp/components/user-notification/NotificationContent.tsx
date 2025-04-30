import ReactMarkdown from "react-markdown";

export const NotificationContent: React.FC<NotificationContentProps> = ({ className, content }) => {
    return <ReactMarkdown className={className}>{content}</ReactMarkdown>;
};

export interface NotificationContentProps {
    className?: string;
    content: string;
}
