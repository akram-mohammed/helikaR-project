var BivariateModal = React.createClass({
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
					<Input type='select' label='Functions' ref='fn' multiple>
						<option value='cov'>Covariance</option>
						<option value='cor'>Correlation</option>
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
		this.props.onClick(this, this.refs.first.getValue(), this.refs.second.getValue(), this.refs.fn.getValue());
	}

});