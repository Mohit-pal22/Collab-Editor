import { useState } from 'react'
import Button from '../../../components/Button'

function Sidebar({ onClick, className, sharedWith }) {
  const [collaborators, setCollaborators] = useState(sharedWith)

  return (
    <div className={`${className} w-1/5 h-screen p-2 bg-black text-black`}>
      <Button 
      className='lg:text-lg text-sm over bg-black text-white border border-red-400' name="Collaborator ❌" 
      onClick={onClick}
      />
      <div className="collaborators p-0 h-full overflow-y-auto">
        <ul>
          {collaborators.map((collaborator) => (
            <li key={collaborator._id}
              className='overflow-clip bg-gray-900 text-center border mt-2 text-white'
            >
              {collaborator.name.toUpperCase()}
            </li>))}
        </ul>
      </div>
    </div>
  )
}

export default Sidebar