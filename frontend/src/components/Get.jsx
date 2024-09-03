import React from 'react'
import axios from 'axios';

const Get = () => {
    const [products, setProducts] = React.useState([]);

    React.useEffect(() => {
        async function getData() {
            let res = await axios.get('http://localhost:3000/products');
            setProducts(res.data);
        }
        getData();
    }, []);

    return (
        <div>
            {
                products.map((product, idx) => (
                    <div key={idx}>
                        <p style={{ color: 'red' }}>{product.name}</p>
                    </div>
                ))
            }
        </div>
    )
}

export default Get