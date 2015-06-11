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
					<Input type='select' label='Functions' ref='third' multiple>
						<option value='mean'>Mean</option>
						<option value='median'>Beta</option>
						<option value='sd'>Standard Deviation</option>
						<option value='variance'>Variance</option>
						<option value='skewness'>Skewness</option>
						<option value='kurtosis'>Kurtosis</option>
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
		this.props.onClick(this, this.refs.first.getValue(), this.refs.second.getValue(), this.refs.third.getValue());
	}

});