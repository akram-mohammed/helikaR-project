var BoxPlotModal = React.createClass({

	getInitialState: function() {
		return {is_group: true};
	},

	render: function() {

		var options_list = [];
		var wololo="enabled";

		this.props.variables.forEach(function (variable) {
			options_list.push(<option value={variable}>{variable}</option>);				
		});

		return (
			<Modal {...this.props} title="Choose data">
				<div className='modal-body'>
					<Input type='select' label='Variable' ref='first'>
						{options_list}
					</Input>
					<Input type='select' label='Group' ref='group'>
						{options_list}
					</Input>
					<Input type="text" label="X-axis name (optional)" ref='x_name' />
					<Input type="text" label="Y-axis name (optional)" ref='y_name' />

				</div>
		        <div className='modal-footer'>
    			    <Button onClick={this.handleClick}>Submit</Button>
        		</div>
			</Modal>
		);
	},

	handleClick: function() {
		this.props.onRequestHide();
		this.props.onClick(this, this.refs.first.getValue(), null, this.refs.group.getValue(), this.refs.x_name.getValue(), this.refs.y_name.getValue());
	},

	handleChange: function() {
		this.setState({is_group: !this.state.is_group});
	}
});