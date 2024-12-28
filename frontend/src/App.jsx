import { RouterProvider } from 'react-router-dom'
import { router } from './Router'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/globals/globals.css'
import { Web3Provider } from './context/Web3Context.jsx';

function App() {

  return (
    <>
    <Web3Provider>
      <ToastContainer />
      <RouterProvider router={router} />
    </Web3Provider>
    </>
  )
}

export default App
