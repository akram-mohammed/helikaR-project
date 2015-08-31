var PlotModal = React.createClass({

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
					<Input type='checkbox' label='Group' ref='boolgrp' onChange={this.handleChange} />
					<Input type='select' label='Variable - X' ref='first'>
						{options_list}
					</Input>

					<Input type='text' label='X-axis name (optional)' ref='xname' />

					<Input type='select' label='Variable - Y' ref='second'>
						{options_list}
					</Input>

					<Input type='text' label='Y-axis name (optional)' ref='yname' />

					<Input type='select' label='Group' ref='group' disabled={this.state.is_group} >
						{options_list}
					</Input>
				</div>
		        <div className='modal-footer'>
    			    <Button onClick={this.handleClick}>Submit</Button>
        		</div>
			</Modal>
		);
	},

	handleClick: function() {
		this.props.onRequestHide();
		if (this.refs.boolgrp.getChecked())
			this.props.onClick(this, this.refs.first.getValue(), this.refs.second.getValue(), this.refs.group.getValue(), this.refs.xname.getValue(), this.refs.yname.getValue());
		else
			this.props.onClick(this, this.refs.first.getValue(), this.refs.second.getValue(), null, this.refs.xname.getValue(), this.refs.yname.getValue());
	},

	handleChange: function() {
		this.setState({is_group: !this.state.is_group});
	}
});