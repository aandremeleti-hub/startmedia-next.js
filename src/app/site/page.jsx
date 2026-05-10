import { Footer } from "../../components/layout/footer/footer"
import { Header } from "../../components/layout/header"
import { SiteCardsSection } from "../../components/layout/site_cards_section"
import { SiteCasesSection } from "../../components/layout/site_cases_section"
import { SiteMainSection } from "../../components/layout/site_main_section"
import { SiteReasonsSection } from "../../components/layout/site_reasons_section"

export default function Site() {
    return (
        <>
            <Header />
            <SiteMainSection/>
            <SiteReasonsSection/>
            <SiteCardsSection/>
            <SiteCasesSection/>
            <Footer/>
        </>
    )
}