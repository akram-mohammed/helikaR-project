var ChoiceModal = React.createClass({
	render: function() {
		return (
			<Modal {...this.props} title="myModal">
				<div className='modal-body'>
				<Input type='select' label='Variables' ref='first' multiple>
					<option value="first">First</option>
					<option value="second">Second</option>
					<option value="third">Third</option>
				</Input>
				<Input type='select' label='Functions' ref='second' multiple>
					<option>Alpha</option>
					<option>Beta</option>
					<option>Gamma</option>
				</Input>	
				</div>
		        <div className='modal-footer'>
    			    <Button onClick={this.handleClick}>Close</Button>
        		</div>
			</Modal>
		);
	},

	handleClick: function() {
		this.props.onRequestHide();
		console.log(this.refs.first.getValue());
		//this.props.onClick();		
	}
});