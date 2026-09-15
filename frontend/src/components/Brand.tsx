import { Ticket } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export function Brand() {
 const { user, isLoading } = useAuth();
 const content = <><Ticket size={25} /><span>crowdpass<span className="accent-text">.</span></span></>;

 const destination = user?.role === 'ADMIN' ? '/admin/dashboard' : user?.role === 'STAFF' ? '/staff/scan' : null;

 return !isLoading && destination
  ? <Link className="brand" to={destination} aria-label="CrowdPass: torna all'area riservata">{content}</Link>
  : <div className="brand">{content}</div>;
}
