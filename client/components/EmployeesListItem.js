var React = require('react/addons');
var request = require('superagent');
var $ = require('jquery');
var EmployeesListStore = require('../stores/EmployeesListStore');
var EmployeesListActions = require('../actions/EmployeesListActions');
var Modal = require('./untiles/Modal');
var ModalStore = require('../stores/ModalStore');
var UserStore = require('../stores/UserStore');
var FormControl = require('./untiles/Form');

var EmployeesSearch = React.createClass({
    getInitialState: function() {
        return {
            photoUrl: this.props.photoUrl || '/img/no_photo.png',
            dataUri: null,
            file: null,
            edit: false,
            submit: false
        };
    },
    handleDrag: function(e) {

        var isDraging = e.type == 'dragenter'

        if(this.catZone) this.catZone.props.update = this.update

        this.setState({isDraging: isDraging})
        this.setState({isDragEnd: false})

    },

    update: function(data){
        this.setState(data);
    },

    openEdit: function(e){
      e.preventDefault();

      this.refs.initials.getDOMNode().value = this.props.initials

      this.setState({
        edit: true
      });
    },

    handlerLoad: function(file) {

        this.setState({isDraging: false});

        if(file.type == 'image/jpeg' || file.type == 'image/png'){
            this.setState({isDragEnd: true});
            this.setState({File: file});

            var data = new FormData();

            data.append('file', file);
        }

    },

    clickHeandler: function(e){

      this.props.initials = this.refs.initials.getDOMNode().value;

      this.setState({
        submit: true,
        edit: false
      });

      UserStore.formSubmit();
    },

    _onClick: function(e){
      e.stopPropagation();
    },

    _onInput: function(e){
      e.target.value = e.target.value;
    },

    _onClose: function(){
      this.setState({
        edit: false
      });
    },

    _deleteAvatar: function(){
      EmployeesListActions.removeImg({id: this.props.id});
      this.setState({
        photoUrl: '/img/no_photo.png'
      })
    },

    render: function() {
        var avatar = this.state.isDraging ?
          (<Dropzone size='156' message="Drop file" handler={this.handlerLoad} />) :
          (<img  onClick={this.openEdit} src={this.state.photoUrl} width='100%' height='100%' />)
        this.catZone = this.state.isDragEnd ? (<ImageCat image={this.state.File} update={this.update} id={this.props.id} />) : null;
        return (
          <div className="employees-list-item">
            <Modal show={this.state.edit} onClose={this._onClose} style="small">
              <FormControl action="/api/admin/person/update" submit={this.state.submit} method="post">
                <div className="avatar">
                  {avatar}
                  {this.state.photoUrl != "/img/no_photo.png" ? <button className="delete-img" onClick={this._deleteAvatar}>
                    <i className="fa fa-trash-o"></i>
                    <span>Remove picture</span>
                  </button> : null}
                </div>

                <input type="hidden" value={this.props.id} name="id" />

                <div className="form-group">
                  <label>Initial: </label>
                  <input className="form-control" ref="initials" name="initials" onClick={this._onClick} onInput={this._onInput}/>
                </div>

                <div className="form-group">
                  <label>Skills: </label>
                  <p>{this.props.skills}</p>
                </div>

              </FormControl>
            </Modal>
            {this.catZone}
            <div className="employee-photo" onDragEnter={this.handleDrag} onDragLeave={this.handleDrag}>
                {avatar}
            </div>
            <span className="initials" ref="initialsDefault">{this.props.initials}</span>
            <span className="skill">{this.props.skills}</span>
          </div>

        );
    }

});

var Dropzone = React.createClass({
  getInitialState: function() {
    return {
      isDragActive: false
    }
  },

  handleDragLeave: function(e) {
    this.setState({
      isDragActive: false
    });
  },

  handleDragOver: function(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";

    this.setState({
      isDragActive: true
    });
  },

  handleDrop: function(e) {
    e.preventDefault();

    this.setState({
      isDragActive: false
    });

    if (this.props.handler) {
      var file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      this.props.handler(file);
    } else {
      console.error('No handler specified to accept the dropped file.');
    }
  },
  render: function() {

    var size = this.props.size || "100pt";
    var dropzoneStyle = this.props.children ? {} : {
      width: size,
      height: size,
      borderRadius: "200px",
      borderWidth: "2px",
      borderColor: "#666",
      borderStyle:  "dashed"
    };

    var messageStyle = {
      display: "table-cell",
      width: size,
      height: size,
      textAlign: "center",
      verticalAlign: "middle",
      fontSize: "10pt",
      textTransform: "uppercase",
      color: "#666"
    };

    return (
      <div className="dropzone" style={dropzoneStyle} onDragLeave={this.handleDragLeave} onDragOver={this.handleDragOver} onDrop={this.handleDrop}>
        {this.props.children || <span style={messageStyle}>{this.props.message || "Drop Here"}</span>}
      </div>
    );
  }

});

var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var ImageCat = React.createClass({
    getInitialProps: function(){
      update: null
    },
    getInitialState: function () {
        return {
            imgSrc: null,
            catShow: true,
            progress: 0
        }
    },
    _close: function(){
        this.setState({
          catShow: false
        });

    },

    unmount: function() {
      var node = this.getDOMNode();
      React.unmountComponentAtNode(node);
      $(node).remove();
    },

    _readImage: function(image){
        var reader = new FileReader();

        reader.onload = function(e){

            this.setState({
                imgSrc: e.target.result
            })
        }.bind(this);

        reader.readAsDataURL(image);
    },

    _getCropped: function(){
        var self = this;
        var node = this.getDOMNode();


        var base64 = $(node).find('.image-cropper-wrapper > img').cropper('getDataURL');

        this.setState({
          progress: 0
        });

        EmployeesListActions.uploadFile({img: base64, filename: this.props.image.name, id: this.props.id})

        EmployeesListStore.onProgress(this._onProgress)
        EmployeesListStore.addUploadListener(this.onUpload)
    },

    _onProgress: function(){
      this.setState({
        progress: EmployeesListStore.getProgress()
      });

      if(this.state.progress == 100){
        this.setState({
          progress: 0
        });
      }
    },

    onUpload: function(){
      this.props.update({photoUrl: EmployeesListStore.getUploadImageUrl() + "?d=" + new Date().getTime()});
      this._close();
      EmployeesListStore.removeUploadListener(this.onUpload);
      this.unmount();
    },

    componentWillMount: function(){
      EmployeesListStore.addUploadListener(this.onUpload)
    },

    componentDidMount: function(){

      this._readImage(this.props.image);

      EmployeesListStore.catImage(this.refs.cropper.getDOMNode(), this.props.image)
    },

    _onCloseModal: function(){

      this.setState({
        catShow: false
      });

      if(window.notify)
        window.notify.close()

    },
    render: function(){
        if(this.state.catShow){

            var progressBar = this.state.progress ? "in progress-bar" : "progress-bar out";

            return (
                <Modal show={this.state.catShow} onClose={this._onCloseModal} style="cat-image" label="Crop Image">
                  <div className="image-cat">
                    <div className="image-cropper-wrapper" ref="cropper">
                      <img src={this.state.imgSrc} />
                    </div>
                    <div className="navigation">

                      {this.state.progress == 0 ? <button className="btn" onClick={this._getCropped}>Save</button> : null}
                      <button className="btn" onClick={this._close}>Cancel</button>

                      <div className={progressBar}><div className="bar" style={{width: this.state.progress + "%"}}><span>{this.state.progress}%</span></div></div>
                    </div>
                  </div>
                </Modal>
                )
        }else{
            return (null)
        }
    }
});

module.exports = ImageCat;
module.exports = Dropzone;
module.exports = EmployeesSearch;