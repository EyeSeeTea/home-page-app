import _ from "lodash";
import { LandingNodeRepository } from "../repositories/LandingNodeRepository";
import { UseCase } from "./UseCase";
import { extractTranslations } from "./common";
import JSZip from "jszip";
import FileSaver from "file-saver";

export class ExportLandingNodesTranslationsUseCase implements UseCase {
    constructor(private landingNodeRepository: LandingNodeRepository) {}

    public async execute(ids: string[]): Promise<void> {
        const models = await this.landingNodeRepository.getPersistedLandingPages();

        const toTranslate = models.find(model => model.find(item => ids.includes(item.id)));
        if (!toTranslate) throw new Error(`Unable to load landing pages`);

        const translations = await extractTranslations(toTranslate);
        const files = _.toPairs(translations);
        const zip = new JSZip();

        for (const [lang, contents] of files) {
            const json = JSON.stringify(contents, null, 4);
            const blob = new Blob([json], { type: "application/json" });
            zip.file(`${lang}.json`, blob);
        }

        const blob = await zip.generateAsync({ type: "blob" });
        FileSaver.saveAs(blob, `translations-landing-page.zip`);
    }
}
