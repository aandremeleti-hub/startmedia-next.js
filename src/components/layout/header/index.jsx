import './style.css'
import logo from '../../../assets/images/home/logo.svg'
import Link from 'next/link'
import Image from 'next/image'

export const Header = () => {
    return (
        <header>
            <Link href="/"><Image src={logo} alt="StartMedia Logo" className="header-logo-img" priority /></Link>
            <nav className='nav-header'>
                <ul>
                    <li><Link href="/">Home</Link></li>
                    <li><Link href="/design">Design</Link></li>
                    <li><Link href="/site">Site</Link></li>
                    <li><Link href="/ia">Ia</Link></li>
                </ul>
            </nav>
            <Link className='btn-header' href="/diagnostico">Diagnóstico</Link>
        </header>

    )
}