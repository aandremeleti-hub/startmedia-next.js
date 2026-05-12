import './style.css'
import { CardDesign } from '../../cards/card-design'
import puzzle_icon_design_card from '../../../assets/images/home/puzzle_icon_design_card.svg'
import icon_ball from '../../../assets/images/home/icon_ball.svg'
import picture_icon_design_card from '../../../assets/images/home/picture_icon_design_card.svg'
import threed_icon_design_card from '../../../assets/images/home/3d_icon_design_card.svg'
import calender_icon_design_card from '../../../assets/images/home/calender_icon_design_card.svg'

export const DesignCardsSection = () => {
    return (
        <section className='design_cards_section'>
            <h1 className='title-design-cards'>O que você ganha?</h1>
            <div className='container-cards-design'>
                <CardDesign
                    imagem={puzzle_icon_design_card}
                    titulo="Estratégia"
                    paragrafo={<>Planejamentos focados na conversão<br /> e crescimento do seu negócio.</>}
                    icone={icon_ball}
                    item1="Análise visual"
                    item2="Plano de ação"
                    item3="Voz e mensagens"
                    item4="Métricas da evolução"
                />
                <CardDesign
                    imagem={picture_icon_design_card}
                    titulo="Criação de posts e carrosséis"
                    paragrafo={<>Artes exclusivas que prendem a atenção<br /> e destacam a sua marca!</>}
                    icone={icon_ball}
                    item1="Artes autorais"
                    item2="Design visual"
                    item3="Múltiplos posts"
                    item4="Identidade garantida"
                />
                <CardDesign
                    imagem={threed_icon_design_card}
                    titulo=" Vídeos e animação"
                    paragrafo={<>Vídeos modernos que engajam seu público<br /> e impulsionam as vendas.</>}
                    icone={icon_ball}
                    item1="Reels animados"
                    item2="Vídeos curtos"
                    item3="Edição em fluxo"
                    item4="Transição dinâmica"
                />
                <CardDesign
                    imagem={calender_icon_design_card}
                    titulo="Stories"
                    paragrafo={<>Posts diários que geram interação<br /> e conectam com sua audiência </>}
                    icone={icon_ball}
                    item1="Enquete visual"
                    item2="Destaques VIP"
                    item3="Avisos urgentes"
                    item4="Chamada para ação"
                />
            </div>
        </section>
    )
}