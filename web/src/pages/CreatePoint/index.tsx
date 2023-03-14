import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {FiArrowLeft} from 'react-icons/fi';
import { MapContainer, TileLayer, Marker,  } from 'react-leaflet'
import { LeafletMouseEvent } from 'leaflet';
import axios from 'axios';
import api from '../../services/api';


import'./styles.css';

import logo from '../../assets/logo.svg';

//array ou objecto: manualmento informar o tipo de variavel
interface Item{
    id: number;
    title: string;
    image_url: string;
}

interface IBGEUFResponse{
    sigla: string;
}

interface IBGECityResponse{
    nome: string;
}

const CreatePoint = () => { 
    const [items, setItems] = useState<Item[]> ([]);
    const [ufs, setUfs] = useState<string[]>([]);
    const [cities, setCities] = useState<string[]>([]);

    const [initialPosition, setInitialPosition] = useState<[number, number]>([0,0]);

    const[formData, setFormData] = useState({
        name:'',
        email:'',
        whatsapp: '',
    })

    const [selectUf, setSelectUf] = useState('0');
    const [selectCity, setSelectCity] = useState('0');
    const [selectItems, setSelectItems] = useState<number[]>([]);
    const [selectPosition, setSelectPosition] = useState<[number, number]>([0,0]);

    const navigate = useNavigate()

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position =>{
            const {latitude, longitude} = position.coords;
            
            setInitialPosition([latitude, longitude]);
        })
    })

    useEffect(() => {
        api.get('items').then(response =>{
            setItems(response.data);
        })
    }, []);

   
    useEffect(() => {
        axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response =>{
            const ufInitials = response.data.map(uf => uf.sigla);
            setUfs(ufInitials);
        });
    }, []);

    useEffect(() => {
        if(selectUf === '0'){
            return;
        }

        axios
            .get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectUf}/municipios`)
            .then(response =>{
            const cityName = response.data.map(city => city.nome);
            setCities(cityName);
        });

    }, [selectUf]);

    function handleSelectUf(event: ChangeEvent<HTMLSelectElement>){
        const uf = event.target.value;

        setSelectUf(uf);
    }


    function handleSelectCity(event: ChangeEvent<HTMLSelectElement>){
        const city = event.target.value;

        setSelectCity(city);
    }

    function handleMapClick(event: LeafletMouseEvent){
        setSelectPosition([
            event.latlng.lat,
            event.latlng.lng,
        ]);
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>){
        const { name, value} = event.target;
        
        setFormData({...formData, [name]: value})
    }

    function handelSelectItem(id: number){
        const alreadySelected = selectItems.findIndex(item => item === id);

        if(alreadySelected >= 0){
            const filteredItems = selectItems.filter(item => item !== id); 
            setSelectItems(filteredItems);
        }else{
            setSelectItems([...selectItems, id]);
        }

    }

    async function handleSubmit(event: FormEvent){
        event.preventDefault();
        const{name, email, whatsapp} = formData;
        const uf = selectUf;
        const city = selectCity;
        const [latitude, longitude] = selectPosition;
        const items = selectItems;

        const data = {
            name,
            email,
            whatsapp,
            uf,
            city,
            latitude,
            longitude,
            items
        };

        await api.post('points', data)
        alert('Ponto de coleta salvo');

        navigate('/');

    }


    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta"/>
                <Link to = "/">
                    <FiArrowLeft />
                    Voltar para home                
                </Link>
            </header>

            <form onSubmit={handleSubmit}>
                <h1>Cadastro do <br/>Cadastro de coleta</h1>

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>
                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input 
                            type="text"
                            name="name"
                            id="name"
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="name">E-mail</label>
                            <input 
                                type="email"
                                name="email"
                                id="email"
                                onChange={handleInputChange}

                            />
                        </div>
                        <div className="field">
                            <label htmlFor="name">Whatsapp</label>
                            <input 
                                type="text"
                                name="whatsapp"
                                id="whatsapp"
                                onChange={handleInputChange}

                                
                            />
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o edereço no mapa</span>
                    </legend>
                    
                    render(
                        <MapContainer 
                            center={initialPosition}
                            zoom={13} 
                            scrollWheelZoom={false} 
                            //onClick={handleMapClick}
                        >

                            <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />



                            <Marker position={selectPosition} />
                        </MapContainer>
                    )

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select 
                                name="uf" 
                                id="uf" 
                                value={selectUf} 
                                onChange={handleSelectUf}
                            >
                                <option value="0">Selecione uma UF</option>
                                {ufs.map(uf => (
                                    <option key={uf} value = {uf}>{uf}</option>
                                ))}
                            </select>
                        </div>

                        <div className="field">
                            <label htmlFor="uf">Cidade</label>
                            <select 
                                name="city" 
                                id="city"
                                value={selectCity}
                                onChange={handleSelectCity}
                            >
                                
                                <option value="0">Selecione uma cidade</option>
                                {cities.map(city => (
                                    <option key={city} value = {city}>{city}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Ítens de coleta</h2>
                        <span>Selecione um ou mais itens abaixo</span>
                    </legend>

                    <ul className="items-grid">
                        {items.map(item => (
                            <li 
                                key={item.id} 
                                onClick={() => handelSelectItem(item.id)}
                                className={selectItems.includes(item.id) ? 'selected' : ''}
                            >
                                <img src={item.image_url} alt={item.title}/>
                                <span>{item.title}</span>
                            </li>
                        ))}    
                    </ul>
                </fieldset>

                <button type='submit'>
                    Cadastrar ponto de coleta
                </button>
            </form>
        </div>    
    );
};

export default CreatePoint;