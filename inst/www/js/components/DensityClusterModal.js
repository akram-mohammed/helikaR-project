var DensityClusterModal = React.createClass({

	getInitialState: function() {
		return {custom_clusters: true};
	},

	render: function() {

		var options_list = [];

		this.props.variables.forEach(function (variable) {
			options_list.push(<option value={variable}>{variable}</option>);				
		});

		return (
			<Modal {...this.props} title="Choose data">
				<div className='modal-body'>
					<Input type='select' label='Variable - X' ref='first'>
						{options_list}
					</Input>
					<Input type='select' label='Variable - Y' ref='second'>
						{options_list}
					</Input>
					<Input type='text' label='Minimum points' ref='minpts' />
					<Input type='text' label='Epsilon'	ref='eps' />
				</div>
		        <div className='modal-footer'>
    			    <Button onClick={this.handleClick}>Submit</Button>
        		</div>
			</Modal>
		);
	},

	handleClick: function() {
		this.props.onRequestHide();
			this.props.onClick(this, this.refs.first.getValue(), this.refs.second.getValue(), this.refs.minpts.getValue(), this.refs.eps.getValue());
	},

	handleChange: function() {
		this.setState({custom_clusters: !this.state.custom_clusters});
	}
});