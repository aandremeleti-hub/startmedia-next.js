import './style.css'
import {CardSitePrimary} from '../../cards/card-site-primary'
import star_icon_site_primary_card from '../../../assets/images/home/star_icon_site_primary_card.svg'
import icon_ball from '../../../assets/images/home/icon_ball.svg'
import wifi_icon_site_primary_card from '../../../assets/images/home/wifi_icon_site_primary_card.svg'
import link_icon_site_primary_card from '../../../assets/images/home/link_icon_site_primary_card.svg'
import medal_icon_site_primary_card from '../../../assets/images/home/medal_icon_site_primary_card.svg'

export const SiteCardsSection = () => {
    return(
        <section className='site_primary_cards_section'>
                    <h1 className='title-site-cards'>O que você ganha?</h1>
                    <div>
                        <div className='container_primary_cards_site'>
                            <CardSitePrimary
                                imagem={star_icon_site_primary_card}
                                titulo="Estratégia"
                                paragrafo="Site pensado para atrair, convencer e converter clientes reais."
                                icone={icon_ball}
                                item1="Análise do público"
                                item2="Funil de vendas"
                                item3="Copy persuasivo"
                                item4="Resultado mensurável"
                            />
                            <CardSitePrimary
                                imagem={wifi_icon_site_primary_card}
                                titulo="Presença e visibilidade"
                                paragrafo="Apareça no Google e conecte clientes ao seu negócio 24 horas."
                                icone={icon_ball}
                                item1="Indexação Google"
                                item2="Domínio próprio"
                                item3="SEO na medida"
                                item4="Tráfego orgânico" />
                        </div>
                        <div className='container_primary_cards_site'>
                            <CardSitePrimary
                                imagem={link_icon_site_primary_card}
                                titulo="Integração total"
                                paragrafo="WhatsApp, redes e funil de vendas todos conectados ao site."
                                icone={icon_ball}
                                item1="Link WhatsApp"
                                item2="Redes sociais"
                                item3="Botões de ação"
                                item4="Fluxo de captura"
                            />
        
                            <CardSitePrimary
                                imagem={medal_icon_site_primary_card}
                                titulo="Credibilidade"
                                paragrafo="Design profissional que gera confiança antes do primeiro contato."
                                icone={icon_ball}
                                item1="Layout moderno"
                                item2="Marca consistente"
                                item3="UX intuitiva"
                                item4="Mobile perfeito" />
                        </div>
                    </div>
                </section>
    )
}