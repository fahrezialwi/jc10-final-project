import React, { Component } from 'react'
import axios from 'axios'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { FilePond, registerPlugin } from 'react-filepond'
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond/dist/filepond.min.css'
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.css'
import URL_API from '../../../configs/urlAPI'

registerPlugin(FilePondPluginImagePreview)

class AddTrip extends Component {

    constructor(props) {
        super(props)
        this.state = {
            path: '',
            tripId: '',
            tripName: '',
            pictureId: '',
            pictureLink: '',
            meetingPoint: '',
            price: '',
            duration: '',
            category: '',
            region: '',
            quota: '',
            description: '',
            itinerary: '',
            priceIncludes: '',
            priceExcludes: '',
            faq: '',
            pictures: [],
            files: []
        }
    }

    componentDidMount() {
        this.createTrip()
    }

    componentWillUnmount() {
        this.onCancelClick()
    }

    createTrip = () => {
        axios.post(
            URL_API + 'trips'
        ).then(res => {
            this.setState({
                tripId: res.data.results.insertId
            })
        })
    }

    getPicturesData = () => {
        axios.get(
            URL_API + 'pictures', {
                params: {
                    trip_id: this.state.tripId
                }
            }
        ).then(res => {
            this.setState({
                pictures: res.data.results
            })
        })
    }

    pictureList = () => {
       return this.state.pictures.map((picture, index) => {
            return (
                <div key={index}>
                    <input 
                        type="radio"
                        onChange={() => this.setState({pictureId: picture.picture_id})}
                        name="isMain"
                        id={picture.picture_id}
                    />
                    <label htmlFor={picture.picture_id}>
                        <img src={URL_API + "files/trip/" + picture.picture_link} width = "100" alt={picture.picture_id}/>
                    </label>
                    <button onClick={() => this.onDeleteClick(picture.picture_id, picture.picture_link)}>Delete</button>
                </div>
            )
        })
    }

    onDeleteClick = (pictureId, pictureLink) => {
        if (this.state.pictures.length > 5) {
            axios.delete(
                URL_API + `pictures/${pictureId}`,{
                    data: {
                        picture_link: pictureLink
                    }
                }
            ).then(res => {
                alert("Picture deleted")
                this.getPicturesData()
            })
        } else {
            alert("Pictures can not less than 5")
        }
    }

    onAddClick = () => {
        if (this.state.pictures.length >= 5) {
            if (this.state.pictureId) {
                axios.patch(
                    URL_API + `trips/${this.state.tripId}`, {
                        path: this.state.path,
                        trip_name: this.state.tripName,
                        meeting_point: this.state.meetingPoint,
                        price: this.state.price,
                        duration: this.state.duration,
                        category: this.state.category,
                        region: this.state.region,
                        quota: this.state.quota,
                        description: this.state.description,
                        itinerary: this.state.itinerary,
                        price_includes: this.state.priceIncludes,
                        price_excludes: this.state.priceExcludes,
                        faq: this.state.faq
                    }
                ).then(res => {
                    axios.patch(
                        URL_API + `pictures/${this.state.pictureId}`, {
                            trip_id: this.state.tripId
                        }
                    ).then(res => {
                        alert("Trip added")
                        this.props.history.push("/dashboard/manage-trips")
                    })
                })
            } else {
                alert("Please select main image")
            }
        } else {
            alert("Pictures can not less than 5")
        }
    }

    onCancelClick = () => {
        axios.delete(
            URL_API + `trips/${this.state.tripId}`
        ).then(res => {
            for (let i = 0; i < this.state.pictures.length; i++) {
                axios.delete(
                    URL_API + `pictures/${this.state.pictures[i].picture_id}`,{
                        data: {
                            picture_link: this.state.pictures[i].picture_link
                        }
                    }
                )
            }
            this.props.history.push("/dashboard/manage-trips")
        })
    }

    render() {
        return (
            <div className="card-body">
                <div className="row">
                    <div className="col-12 mb-3">
                        <h2>Add Trip</h2>
                    </div>
                    <div className="col-8 mb-3">
                        Trip Name
                        <input
                            type="text"
                            onChange={e => this.setState({tripName: e.target.value})}
                            className="form-control"
                        />
                        <div className="row">
                            <div className="col-4 pr-0">
                                <p className="mt-1">http://localhost:3000/trip/</p>
                            </div>
                            <div className="col-8 pl-0">
                                <input
                                    type="text"
                                    onChange={e => this.setState({path: e.target.value})}
                                    className="form-control"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="col-8 mb-3">
                        Description
                        <textarea
                            rows={7}
                            onChange={e => this.setState({description: e.target.value})}
                            className="form-control"
                        />
                    </div>
                    <div className="col-8 mb-3">
                        Meeting Point
                        <input
                            type="text"
                            onChange={e => this.setState({meetingPoint: e.target.value})}
                            className="form-control"
                        />
                    </div>
                    <div className="col-8 mb-3">
                        Price
                        <input
                            type="text"
                            onChange={e => this.setState({price: e.target.value})}
                            className="form-control"
                        />
                    </div>
                    <div className="col-8 mb-3">
                        Category
                        <input
                            type="text"
                            onChange={e => this.setState({category: e.target.value})}
                            className="form-control"
                        />
                    </div>
                    <div className="col-8 mb-3">
                        Region
                        <input
                            type="text"
                            onChange={e => this.setState({region: e.target.value})}
                            className="form-control"
                        />
                    </div>
                    <div className="col-8 mb-3">
                        Duration
                        <input
                            type="text"
                            onChange={e => this.setState({duration: e.target.value})}
                            className="form-control"
                        />
                    </div>
                    <div className="col-8 mb-3">
                        Quota
                        <input
                            type="text"
                            onChange={e => this.setState({quota: e.target.value})}
                            className="form-control"
                        />
                    </div>
                    <div className="col-8 mb-3">
                        Itinerary
                        <ReactQuill
                            onChange={value => this.setState({itinerary: value})}
                        />
                    </div>
                    <div className="col-8 mb-3">
                        Price Includes
                        <ReactQuill
                            onChange={value => this.setState({priceIncludes: value})}
                        />
                    </div>
                    <div className="col-8 mb-3">
                        Price Excludes
                        <ReactQuill
                            onChange={value => this.setState({priceExcludes: value})}
                        />
                    </div>
                    <div className="col-8 mb-3">
                        FAQ
                        <ReactQuill
                            onChange={value => this.setState({faq: value})}
                        />
                    </div>

                    <div className="col-8 mb-5">
                        {this.pictureList()}
                    </div>

                    <div className="col-8 mb-5">
                        <FilePond 
                            ref={ref => this.pond = ref}
                            files={this.state.files}
                            allowMultiple={true}
                            onprocessfiles={() => this.getPicturesData()}
                            server={{
                                process: (fieldName, file, metadata, load, error, progress, abort, transfer, options) => {
                                    const fd = new FormData()
                                    fd.append(fieldName, file, file.name)
                                    fd.append("trip_id", this.state.tripId)
                        
                                    const request = new XMLHttpRequest()
                                    request.open('POST', URL_API + 'pictures')
                        
                                    request.upload.onprogress = (e) => {
                                        progress(e.lengthComputable, e.loaded, e.total);
                                    }
                    
                                    request.onload = function() {
                                        if (request.status >= 200 && request.status < 300) {
                                            load(request.responseText)
                                        } else {
                                            error('Upload error')
                                        }
                                    }
                                    request.send(fd)
                                    return {
                                        abort: () => {
                                            request.abort()
                                            abort()
                                        }
                                    }
                                },

                                revert: (uniqueFileId, load, error) => {
                                    const request = new XMLHttpRequest()
                                    request.open('DELETE', URL_API + 'pictures')
                                    request.send(uniqueFileId)
                                    error('Delete error')
                                    load()
                                }
                            }}
                        >
                        </FilePond>
                    </div>

                    <div className="col-8 mb-5">
                        <button onClick={() => this.onAddClick()} className="btn btn-dark">Add Trip</button>
                        <button onClick={() => this.onCancelClick()} className="btn btn-dark ml-2" >Cancel</button>  
                    </div>
                </div>
            </div>
        )
    }
}

export default AddTrip