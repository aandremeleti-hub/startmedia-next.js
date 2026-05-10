import { CardIaThird } from '../../cards/card-ia-third'
import './style.css'
import line from '../../../assets/images/home/line.svg'
import quotation_marks from '../../../assets/images/home/quotation_marks.svg'

export const IaSpecialistsSection = () => {
    return (
        <section >
            <div className='content-ia-specialists-section'>
                <h1 className='title-ia-third-cards'>O que dizem os especialistas?</h1>
                <div className='container-ia-third-cards'>
                    <CardIaThird
                        linha={line}
                        aspas={quotation_marks}
                        titulo="A IA é o maior maremoto tecnológico desde a chegada da internet."
                        nome="Satya Nadella"
                        cargo="CEO da Microsoft" />
                    <CardIaThird
                        linha={line}
                        aspas={quotation_marks}
                        titulo="A IA é a coisa mais profunda em que a humanidade está trabalhando — mais profunda do que o fogo ou a eletricidade."
                        nome="Sundar Pichai"
                        cargo="CEO do Google" />
                    <CardIaThird
                        linha={line}
                        aspas={quotation_marks}
                        titulo="A IA é a nova eletricidade."
                        nome="Andrew Ng"
                        cargo="Cofundador do Google Brain" />
                </div>
            </div>
        </section>
    )
}