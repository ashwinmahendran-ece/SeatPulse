import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div style={{ textAlign: 'center', padding: '50px', marginTop: '100px' }}>
      <h1 style={{ fontSize: '3rem', color: '#ff4757' }}>404</h1>
      <h2>Oops! We can't find that page.</h2>
      <p>The event or page you are looking for doesn't exist or has been moved.</p>
      <Link to="/" style={{ padding: '10px 20px', backgroundColor: '#2ed573', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
        Go Back Home
      </Link>
    </div>
  );
};

export default NotFound;