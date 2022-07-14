import { Container } from "@material-ui/core";
import { useCallback } from "react";
import styled from "styled-components";
import i18n from "../../../locales";
import { MarkdownViewer } from "../../components/markdown-viewer/MarkdownViewer";
import { Modal, ModalContent } from "../../components/modal";
import { useAppContext } from "../../contexts/app-context";

export const AboutPage = () => {
    const { setAppState } = useAppContext();

    const contents = [
        `# ${i18n.t("About Home Page App")}`,
        `#### ${i18n.t("Distributed under GNU GLPv3")}`,
        i18n.t("DHIS2 Home page App is a DHIS2 application that aims to provide direct links to Dhis2 applications."),
        i18n.t(
            "This application has been entirely funded by the WHO Global Malaria Programme to support countries using DHIS2 in strengthening the collection and use of health data. The application has been designed by [Lushomo](https://lushomo.net) and developed by [EyeSeeTea SL](http://eyeseetea.com). The source code and release notes can be found at the [WHO GitHub repository](https://github.com/EyeSeeTea/home-page-app). If you wish to contribute to the development of Home Page App with new features, please contact [EyeSeeTea](mailto:hello@eyeseetea.com). To continue developing the tool in a coordinated manner please always contact also [WHO](mailto:integrated-data@who.int)",
            { nsSeparator: false }
        ),
        i18n.t(
            "*Disclaimer: The WHO has developed this application to support countries build capacity for health data collection and use. WHO provides a series of tutorials to support countries to use the WHO DHIS2 standard packages which can be found in the [WHO Tutorial GitHub repository](https://github.com/WorldHealthOrganization/DHIS2-tutorials) and can be installed in the application. WHO provides no assurance as to the validity, accuracy or completeness of any other tutorials built by the application's user community.*",
            { nsSeparator: false }
        ),
    ].join("\n\n");

    const goHome = useCallback(() => {
        setAppState({ type: "HOME" });
    }, [setAppState]);

    return (
        <StyledModal onGoHome={goHome} centerChildren={true}>
            <ModalContent>
                <Container maxWidth="lg">
                    <MarkdownViewer source={contents} center={true} />
                    <LogoWrapper>
                        <Logo alt={i18n.t("World Health Organization")} src="img/logo-who.svg" />
                        <Logo alt={i18n.t("EyeSeeTea")} src="img/logo-eyeseetea.png" />
                        <Logo alt={i18n.t("Lushomo")} src="img/logo-lushomo.png" />
                    </LogoWrapper>
                </Container>
            </ModalContent>
        </StyledModal>
    );
};

const StyledModal = styled(Modal)`
    ${ModalContent} {
        min-height: 100vh;
        background-color: #276696;
        padding: 0px;
        margin: 0px 10px 20px 10px;
    }

    ${MarkdownViewer} {
        margin-right: 28px;
        text-align-last: unset;
    }
`;

const LogoWrapper = styled.div`
    align-items: center;
`;

const Logo = styled.img`
    width: 200px;
    margin: 0 50px;
`;
