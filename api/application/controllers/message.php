<?php
require(APPPATH . 'libraries/REST_Controller.php');

class Message extends REST_Controller {

	private $id;

	function __construct() {
		parent::__construct();
		$this->id = $this->session->userdata('id');
		$this->load->model('message_model');
	}

  public function messageIndex_get() {
		// Pass ID to Function and Return Results.
  	$dbres = $this->message_model->getGroups($this->id);
		$this->response(($dbres) ? $dbres : ['status' => false], 200);
  }

  public function message_get() {

		// Retrieve Passed Post ID.
		$dbres = false;
		$postid = $this->get('id');
		$sort = $this->get('type');
		// Pass Retrieve data to message Function
		if($postid != NULL) $dbres = $this->message_model->getMessages($this->id, $postid, $sort, date('Y-m-d H:i:s'));
		$this->response(($dbres) ? $dbres : ['status' => false], 200);

  }

	public function message_post() {
		// Get message details.
		$dbres = false;
		$userid = $this->id;
		$datetime = date('Y-m-d H:i:s');
		$postid = $this->post('postid');
		$message =  $this->post('message');
		// If correct variables exist pass to add message function.
		if($message !=NULL && $postid !=NULL) $dbres = $this->message_model->addMessage($userid, $postid, $message, $datetime);
		// on success status code 200 (OK), else unauthorized (401).
		$this->response(($dbres) ? 200 : 401);

	}

}
