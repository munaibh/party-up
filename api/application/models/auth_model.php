<?php

class Auth_model extends CI_Model {

	function __construct() {
		parent::__construct();
	}

	public function checkUser($username, $password) {

		// Query Users data.
		$stmnt = "SELECT * FROM user INNER JOIN userdetail
							ON user.userid = userdetail.userid
							WHERE USERNAME = '{$username}'";

		$dbres = $this->db->query($stmnt)->result_array();

		if(count($dbres) === 1) {
			// If user is valid return details.
			$dbres = $dbres[0];
			$crypt = crypt($password, $dbres['password']);
			if($crypt == $dbres['password']) {
				$output = array(
					'id'  => $dbres['userid'],
					'username' => $dbres['username'],
					'avatarurl' => $dbres['avatarurl'],
					'interests' => explode(',', $dbres['games']),
					'psn' => $dbres['psn'],
					'xbox' => $dbres['xbox'],
					'region' => $dbres['region'],
					'status' => true
				);

				return $output;
			}
		}

		return false;
	}

	public function addUser($post_data, $file_data) {

		// Add User Credentials to Array
		$usercred = [
			'avatarurl' => $this->addAvatar($file_data),
			'username' => $post_data['username'],
			'password' => crypt($post_data['password']),
			'datetime' => date('Y-m-d H:i:s')
		];

		// Add User to Dabase
		$this->db->insert('user', $usercred);

		// Add User Information to Array
		$userinfo = [
			'userid' =>$this->db->insert_id(),
			'psn'   => $post_data['psn'],
			'xbox'  => $post_data['xbx'],
			'region'  => $post_data['country'],
			'language' => $post_data['language'],
			'games' => $post_data['interests'],
		];

		// Add User Details to Database.
		$this->db->insert('userdetail', $userinfo);
		return ($this->db->insert_id() != null) ? true : false;

	}

	public function addAvatar($file_data) {

		// Get File Data and Extension.
		$extension = explode('.', $file_data['name']);
		$extension = strtolower(end($extension));
		$whitelist = array('jpg', 'png');
		// If file is allowed extension.
		if(in_array($extension, $whitelist)) {
			if($file_data['error'] === 0) {
				$file_name_new = uniqid('', true) . '.' . $extension;
				$destination = FCPATH . 'avatars/' . $file_name_new;
				move_uploaded_file($file_data['tmp_name'], $destination);
				return  $file_name_new;
			}

		}
		// On error return generic image.
		return "generic.jpg";

	}

	public function existingUser($username) {
		// Check if user exists.
		$stmnt = "SELECT * FROM user WHERE username = '{$username}'";
		$numrows = $this->db->query($stmnt)->num_rows();
		return ($numrows != 1) ? true : false;
	}

	public function updateDetails($userid, $arr) {

		if($userid == $arr['id']) {

			// Store details in variables.
			$interests = explode(',', $arr['interests']);
			$trimmed = array();
			foreach($interests as $i) {
				if($i != "") $trimmed[] = trim($i);
			}

			// Create Insert Statement.
			$insert = [
				'psn' => $arr['psn'],
				'xbox' => $arr['xbox'],
				'games' => implode(',', $trimmed),
			];

			// Update Details
			$this->db->where('userid', $arr['id']);
			$this->db->update('userdetail', $insert);

			// on success return details.
			return ['psn' => $arr['psn'], 'xbox' => $arr['xbox'], 'games' => $trimmed];

		}

		// on error return false.
		return false;

	}

}
