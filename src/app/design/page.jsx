import { Header } from "../../components/layout/header"
import { DesignMainSection } from "../../components/layout/design_main_section"
import { DesignCardsSection } from "../../components/layout/design_cards_section"
import { DesignDomeSection } from "../../components/layout/design_dome_section"
import { DesignGugaSection } from "../../components/layout/design_guga_section"
import { Footer } from "../../components/layout/footer/footer"



export default function Design() {
    return (
        <>
            <Header />
            <DesignMainSection />
            <DesignCardsSection/>
            <DesignDomeSection/>
            <DesignGugaSection/>
            <Footer/>
        </>
    )
}