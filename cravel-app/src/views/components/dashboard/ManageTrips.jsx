import React, { Component } from 'react'
import axios from 'axios'
import URL_API from '../../../helpers/urlAPI'

class ManageTrip extends Component {

    constructor(props) {
        super(props)
        this.state = {
            trips : []
        }
    }

    componentDidMount(){
        this.getData()
    }

    getData = () => {
        axios.get (
            URL_API + 'trips'
        ).then((res)=> {
            this.setState({
                trips: res.data.results
            })
        })
    }

    tripList = () => {
        return this.state.trips.map((trip, index) => {
            return (
                <tr key={trip.trip_id}>
                    <td>{index+1}</td>
                    <td>{trip.trip_name}</td>
                    <td>{trip.meeting_point}</td>
                    <td>{trip.price}</td>
                    <td>{trip.category}</td>
                    <td>{trip.duration}</td>
                    <td><img src={trip.picture_main} alt={trip.name} width="100"/></td>
                    <td><button className="btn btn-dark">Edit</button></td>
                    <td><button className="btn btn-dark">Delete</button></td>
                </tr>
            )
        })
    }

    render() {
        return (
            <div className="card-body">
                <div className="row">
                    <div className="col-12">
                        <div className="table-responsive">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>No.</th>
                                        <th>Name</th>
                                        <th>Meeting Point</th>
                                        <th>Price</th>
                                        <th>Category</th>
                                        <th>Duration</th>
                                        <th>Picture</th>
                                        <th colSpan="2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.tripList()}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default ManageTrip