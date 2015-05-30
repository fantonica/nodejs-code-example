/**
 * @jsx React.DOM
 */

var React = require('react');
var ViewsActions = require('../actions/ViewsActions');
var ViewsStore = require('../stores/ViewsStore');

var ViewsListingItem = React.createClass({

    getDefaultProps: function(){
      return {

      }
    },

    deleteItem: function(e){
      e.preventDefault();

      if(confirm("Do you want delete?")){
        this.getDOMNode().parentNode.removeChild(this.getDOMNode());
        ViewsActions.deleteView({
          id: this.props.data._id
        });
      }
    },

    render: function() {

        var type = this.props.data.type.replace('_', ' ');

        return (
            <li className="row">
                <div className="col9">
                    <strong>{this.props.data.name}</strong>
                    <span>{type}</span>
                </div>
                <div className="col3 collapsed actions">
                    <a href={"/" + this.props.data._id} target="_blank" className="col4">Link</a>
                    <a href={"/admin/dashboard/edit?id=" + this.props.data._id} className="col4">Rediger</a>
                    <a href="#" className="col4" onClick={this.deleteItem}>Slet</a>
                </div>
            </li>
        );
    }

});

module.exports = ViewsListingItem;