import _ from "lodash";
import { ChangeEvent, useCallback, useState } from "react";
import { useAppContext } from "../../contexts/app-context";
import { LandingNode } from "../../../domain/entities/LandingNode";
import i18n from "../../../locales";

export default function useImageFileUpload(updateNode: (value: React.SetStateAction<LandingNode>) => void) {
    const { compositionRoot } = useAppContext();

    const [faviconWarnings, setFaviconWarnings] = useState<string[]>([]);

    const processImageFile = (file: File, fileType: keyof LandingNode) => {
        const reader = new FileReader();
        reader.onload = e => {
            const img = new Image();
            img.onload = () => {
                const width = img.width;
                const height = img.height;
                const aspectRatio = width / height;

                setFaviconWarnings([]);
                if (fileType === "favicon") {
                    const aspectRatioWarnings = [
                        ...(!isAspectRatioWithinMargin(aspectRatio)
                            ? [
                                  i18n.t("Please ensure that your favicon has a {{aspectRatio}} aspect ratio.", {
                                      aspectRatio: FAVICON_ASPECT_RATIO.fraction,
                                  }),
                              ]
                            : []),
                    ];

                    const imageDimensionWarnings = [
                        ...(!(isWithinMargin(width) && isWithinMargin(height))
                            ? [
                                  i18n.t("Please use an icon of {{max}}x{{max}} pixels or smaller.", {
                                      max: FAVICON_MAX_SIZE,
                                  }),
                              ]
                            : []),
                    ];

                    const warnings = [...aspectRatioWarnings, ...imageDimensionWarnings];
                    setFaviconWarnings(warnings);
                }
            };
            if (e.target?.result) {
                img.src = e.target.result as string;
            }
        };
        reader.readAsDataURL(file);
    };

    const handleImageFileUpload = useCallback(
        (event: ChangeEvent<HTMLInputElement>, fileType: keyof LandingNode) => {
            const file = _.first(event.target.files);

            file?.arrayBuffer().then(async data => {
                const icon = await compositionRoot.instance.uploadFile(data, file.name);
                processImageFile(file, fileType);
                updateNode(node => ({ ...node, [fileType]: icon }));
            });
        },
        [compositionRoot.instance, updateNode]
    );

    const uploadIcon = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => handleImageFileUpload(event, "icon"),
        [handleImageFileUpload]
    );

    const uploadFavicon = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => handleImageFileUpload(event, "favicon"),
        [handleImageFileUpload]
    );

    return {
        faviconWarnings,
        uploadFavicon,
        uploadIcon,
    };
}

const FAVICON_ASPECT_RATIO = { fraction: "1:1", value: 1 };
const FAVICON_MAX_SIZE = 128;

const ALLOWED_MARGIN = 5;
const ASPECT_RATIO_MARGIN = 0.015;

const isWithinMargin = (dimension: number): boolean => {
    return dimension >= FAVICON_MAX_SIZE - ALLOWED_MARGIN && dimension <= FAVICON_MAX_SIZE + ALLOWED_MARGIN;
};

const isAspectRatioWithinMargin = (aspectRatio: number): boolean =>
    aspectRatio >= FAVICON_ASPECT_RATIO.value - ASPECT_RATIO_MARGIN &&
    aspectRatio <= FAVICON_ASPECT_RATIO.value + ASPECT_RATIO_MARGIN;
