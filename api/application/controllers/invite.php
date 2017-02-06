<?php
require(APPPATH . 'libraries/REST_Controller.php');

class Invite extends REST_Controller {

	private $id;

	function __construct() {
		parent::__construct();
		$this->id = $this->session->userdata('id');
		$this->load->model('invite_model');
	}

	public function invite_get() {
		// Retrieve pending invites.
		$dbres = $this->invite_model->pendingInvites($this->id);
		$this->response($dbres, 200);
	}

	public function invite_post() {

		// Initilize invite variables.
		$dbres = false;
		$inviteid = (int) $this->post('invite');
		$status = (int) $this->post('status');

		// If inviteid and status are valid send invite.
		if($inviteid != NULL && $status <= 2) {
			$dbres = $this->invite_model->manageInvite($this->id, $inviteid, $status);
		}

		// Return empty array and correct http header.
		$this->response([], ($dbres) ? 200 : 401);

	}

  public function invite_delete($id) {

		// If id valid cancel invite
		$dbres = false;
		if($id != NULL) {
			$dbres = $this->invite_model->cancelInvite($id, $this->id);
		}

		// On error return false.
		$this->response(['status' => $dbres], 200);

	}
}
