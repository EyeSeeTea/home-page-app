import { User } from "../../domain/entities/User";
import { StringRecord } from "../../types/utils";

type ContentVariable = StringRecord<{
    displayedName: string;
    username: string;
}>;

type VariableOption = {
    label: string;
    value: `{{${keyof ContentVariable}}}`;
};

export const contentVariables: VariableOption[] = [
    { label: "Displayed name", value: "{{displayedName}}" },
    { label: "Username", value: "{{username}}" },
];

export function generateVariables(props: { user: User }): ContentVariable {
    const { user } = props;
    return {
        displayedName: user.name,
        username: user.username,
    };
}

export function replaceContentVariables(content: string, variables: ContentVariable): string {
    return (Object.keys(variables) as Array<keyof ContentVariable>).reduce((acc, key) => {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
        return acc.replace(regex, variables[key]);
    }, content);
}
