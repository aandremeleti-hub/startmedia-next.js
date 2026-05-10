import Image from 'next/image'
import './style.css'

export const CardDesign = ({ imagem, titulo, paragrafo, icone, item1, item2, item3, item4 }) => {
    return (
        <div className='content-card-design'>
            <div className='card-design'>
                <Image className="card-design-image" src={imagem} alt="" />

                <h1 className="card-design-title">{titulo}</h1>

                <p className="card-design-text">{paragrafo}</p>

                <div className="card-design-items">
                    <div className="card-design-column">
                        <div className="card-design-item">
                            <Image src={icone} alt="" />
                            <p>{item1}</p>
                        </div>
                        <div className="card-design-item">
                            <Image src={icone} alt="" />
                            <p>{item2}</p>
                        </div>
                    </div>

                    <div className="card-design-column">
                        <div className="card-design-item">
                            <Image src={icone} alt="" />
                            <p>{item3}</p>
                        </div>
                        <div className="card-design-item">
                            <Image src={icone} alt="" />
                            <p>{item4}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
