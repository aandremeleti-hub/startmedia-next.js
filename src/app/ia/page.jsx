import { Header } from "../../components/layout/header"
import { Footer } from "../../components/layout/footer/footer"
import { IaMainSection } from "../../components/layout/ia_main_section"
import { IaPrimaryCardsSection } from "../../components/layout/ia_primary_cards_section"
import { IaSpecialistsSection } from "../../components/layout/ia_specialists-section"
import { IaWHySection } from "../../components/layout/ia_why_section"

export default function Ia() {
    return (
        <>
            <Header/>
            <IaMainSection/>
            <IaPrimaryCardsSection/>
            <IaWHySection/>
            <IaSpecialistsSection/>
            <Footer/>
        </>
    )
}