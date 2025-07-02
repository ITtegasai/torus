import { useCookies } from 'react-cookie';
import { Navigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({ component }) => {
  const location = useLocation();
  const [cookies,setCookie] = useCookies(['access_token']);
  const isAuthenticated = Boolean(cookies?.access_token?.length);

  const params = new URLSearchParams(location.search);
  const referrerParam = params.get('referrer');
  const user = params.get('user');
  
  if (referrerParam) {
    setCookie('referrer', JSON.stringify({
      referrer: referrerParam,
      user
    }));
  }

  if(!isAuthenticated && referrerParam) {
    return <Navigate to='/sign-up'/>
  }

  return isAuthenticated ? component : <Navigate to="/login" />;
};

export default PrivateRoute;