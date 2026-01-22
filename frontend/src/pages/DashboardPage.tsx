import { useState } from 'react'
import axios from 'axios'
import { useStore } from '../store'
import { useNavigate } from 'react-router-dom'

export default function DashboardPage() {
  const [newTicketTitle, setNewTicketTitle] = useState('')
  const [newTicketDescription, setNewTicketDescription] = useState('')
  const { user, tickets, setTickets, logout } = useStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    logout()
    navigate('/')
  }

  const handleCreateTicket = async () => {
    if (!newTicketTitle || !newTicketDescription) return

    try {
      const token = localStorage.getItem('token')
      const response = await axios.post('http://localhost:8080/api/tickets', {
        title: newTicketTitle,
        description: newTicketDescription,
        user_id: user?.id
      }, {
        headers: { Authorization: token }
      })

      setTickets([...tickets, response.data])
      setNewTicketTitle('')
      setNewTicketDescription('')
    } catch (err) {
      console.error('Failed to create ticket:', err)
    }
  }

  const handleUpdateStatus = async (ticketId: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.put(`http://localhost:8080/api/tickets/${ticketId}`, {
        status: newStatus
      }, {
        headers: { Authorization: token }
      })

      setTickets(tickets.map(t => t.id === ticketId ? response.data : t))
    } catch (err) {
      console.error('Failed to update ticket status:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">Ticket System</h1>
              </div>
            </div>
            <div className="flex items-center">
              <span className="mr-4 text-sm text-gray-500">Welcome, {user?.username}</span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-b border-gray-200 pb-5">
            <h2 className="text-lg font-medium text-gray-900">Your Tickets</h2>
          </div>

          <div className="mt-6">
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Create New Ticket</h3>
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Title
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="title"
                        id="title"
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={newTicketTitle}
                        onChange={(e) => setNewTicketTitle(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="description"
                        id="description"
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        value={newTicketDescription}
                        onChange={(e) => setNewTicketDescription(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    onClick={handleCreateTicket}
                    disabled={!newTicketTitle || !newTicketDescription}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    Create Ticket
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col">
              <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                  <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                            Title
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Description
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Status
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Created
                          </th>
                          <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {tickets.map((ticket) => (
                          <tr key={ticket.id}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                              {ticket.title}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {ticket.description}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              <select
                                value={ticket.status}
                                onChange={(e) => handleUpdateStatus(ticket.id, e.target.value)}
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  ticket.status === 'open' ? 'bg-green-100 text-green-800' :
                                  ticket.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}
                              >
                                <option value="open">Open</option>
                                <option value="in_progress">In Progress</option>
                                <option value="closed">Closed</option>
                              </select>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {new Date(ticket.created_at).toLocaleString()}
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                              <button
                                onClick={() => handleUpdateStatus(ticket.id, 'closed')}
                                className="text-red-600 hover:text-red-900"
                              >
                                Close
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
