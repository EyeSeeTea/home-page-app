import { TranslatableText } from "../../domain/entities/TranslatableText";

export interface JSONAction {
    _version: number;
    id: string;
    name: TranslatableText;
    icon: string;
    type: string;
    disabled: boolean;
    dhisVersionRange: string;
    dhisAppKey: string;
    dhisLaunchUrl: string;
    dhisAuthorities: string[];
}
